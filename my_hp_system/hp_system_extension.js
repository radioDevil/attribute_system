// ====================================================================================================
// MY HP SYSTEM EXTENSION
// Это пример расширения Silly Tavern для управления очками здоровья (HP) главного героя
// с использованием Function Calling.
// ====================================================================================================

// === Объявление переменных ===
// 'let' - это аналог 'var' или просто объявления переменной.
// 'mainCharacterHP' будет хранить текущее здоровье нашего героя.
let mainCharacterHP = 100; // Начальное HP главного героя

// === Вспомогательные функции (не вызываются LLM напрямую) ===
// Эти функции могут быть полезны для внутреннего управления HP,
// например, если ты захочешь добавить UI элементы позже, или для отладки.

/**
 * Возвращает текущее значение HP главного героя.
 * @returns {number} Текущее HP.
 */
function getCharacterHP() {
    return mainCharacterHP;
}

/**
 * Устанавливает новое значение HP для главного героя.
 * @param {number} newHP - Новое значение HP.
 */
function setCharacterHP(newHP) {
    // Убедимся, что HP не опускается ниже 0, если вдруг передано отрицательное значение.
    mainCharacterHP = Math.max(0, newHP);
    console.log(`[HP System] Main character HP set to: ${mainCharacterHP}`);
    // В будущем здесь можно добавить код для обновления пользовательского интерфейса
}

// === Основная функция, которая изменяет HP ===
// Это та функция, которая будет выполнять фактическую логику уменьшения HP.
// LLM будет вызывать "обертку" для этой функции через Silly Tavern.

/**
 * Уменьшает HP главного героя на указанную величину.
 * @param {number} amount - Количество урона, которое получает герой. Должно быть положительным числом.
 * @returns {string} Сообщение о текущем состоянии HP героя или об ошибке.
 */
function takeDamage(amount) {
    // Проверка входных данных: 'typeof' проверяет тип переменной.
    if (typeof amount !== 'number' || amount <= 0) {
        // 'console.warn' выводит предупреждение в консоль разработчика браузера (F12).
        console.warn("[HP System] takeDamage called with an invalid or non-positive amount:", amount);
        return "Error: Invalid damage amount provided. HP remains unchanged.";
    }

    // Вычитаем урон из текущего HP.
    mainCharacterHP -= amount;

    // Убедимся, что HP не опускается ниже нуля.
    if (mainCharacterHP < 0) {
        mainCharacterHP = 0;
    }

    // Формируем сообщение для логирования и для возврата LLM.
    const message = `[HP System] Main character took ${amount} damage. Current HP: ${mainCharacterHP}.`;
    console.log(message); // Выводим в консоль Silly Tavern для отладки.

    // Проверяем, был ли герой побежден.
    if (mainCharacterHP === 0) {
        return `The main character has been defeated! Current HP: ${mainCharacterHP}.`;
    } else {
        // Если герой еще жив, возвращаем текущее HP.
        return `Main character's current HP is ${mainCharacterHP}.`;
    }
}

// === Регистрация функции для LLM через Silly Tavern ===
// Это самая важная часть. Мы говорим Silly Tavern, что у нас есть "инструмент"
// с определенным именем, описанием и параметрами, который LLM может вызывать.

// 'SillyTavern.getContext()' предоставляет доступ к API Silly Tavern.
// 'registerFunctionTool' регистрирует нашу функцию.
SillyTavern.getContext().registerFunctionTool({
    // 'name': Имя функции, которое LLM будет использовать в своем выводе.
    name: 'take_damage',
    // 'description': ОЧЕНЬ ВАЖНОЕ описание. Оно должно быть максимально четким и
    // инструктировать LLM, КОГДА и КАК использовать эту функцию.
    // Хорошее описание помогает LLM принимать правильные решения.
    description: 'Reduces the main character\'s current health points (HP) by a specified amount. Call this function *whenever* the main character suffers damage from an attack, spell, environmental hazard, or any other source of harm. The model *must* determine the appropriate damage amount based on the narrative context and the severity of the event. Do not call this if the character is not explicitly described as taking harm or if the damage is explicitly stated to be resisted or negated. For minor harm, use small numbers (e.g., 1-5); for significant harm, use larger numbers (e.g., 10-20); for critical or potentially fatal blows, use very large numbers (e.g., 30+).',
    // 'parameters': Описание входных параметров функции в формате JSON Schema.
    // Это как объявление структуры или класса с полями для C++/C#.
    parameters: {
        type: 'object', // Указывает, что параметры передаются как объект.
        properties: { // Описывает свойства этого объекта (т.е. параметры функции).
            amount: {
                type: 'integer', // Тип параметра: целое число.
                description: 'The numerical amount of damage the main character receives. This should be a positive integer reflecting the severity of the harm. For example, a minor scratch might be 2, a solid hit 10, a devastating blow 30.'
            }
        },
        required: ['amount'] // Указывает, что параметр 'amount' является обязательным.
    },
    // 'callback': Это функция, которую Silly Tavern вызовет, когда LLM сгенерирует
    // запрос на 'take_damage'. 'args' будет объектом, содержащим параметры.
    // 'async' означает, что эта функция может выполнять асинхронные операции (как Promise в C#).
    callback: async (args) => {
        console.log(`[HP System] LLM requested take_damage with amount: ${args.amount}`);
        // Вызываем нашу реальную JavaScript-функцию 'takeDamage' с полученным значением.
        const damageResult = takeDamage(args.amount);
        // Результат выполнения нашей функции будет передан обратно LLM,
        // чтобы она могла использовать его для формирования окончательного ответа.
        return damageResult;
    }
});

// Если ты хочешь иметь возможность сбросить HP в любой момент (например, для новой игры),
// ты можешь зарегистрировать еще одну функцию.
SillyTavern.getContext().registerFunctionTool({
    name: 'reset_hp',
    description: 'Resets the main character\'s health points (HP) to a default value, typically used at the start of a new scenario or when healing fully.',
    parameters: {
        type: 'object',
        properties: {
            initial_hp: {
                type: 'integer',
                description: 'The HP value to reset to. If not provided, it will default to 100.'
            }
        },
        required: [] // Параметры не обязательны
    },
    callback: async (args) => {
        const resetTo = args.initial_hp || 100; // Если initial_hp не указано, сбросить до 100
        setCharacterHP(resetTo);
        const message = `[HP System] Main character HP has been reset to ${resetTo}.`;
        console.log(message);
        return message;
    }
});

console.log("[HP System] HP System Extension loaded. Current HP: " + mainCharacterHP);

// Для отладки ты можешь экспортировать функции, чтобы вызывать их из консоли браузера,
// но для обычного использования расширения это не всегда необходимо.
// window.myHPExtension = {
//     getHP: getCharacterHP,
//     setHP: setCharacterHP,
//     takeDamageManually: takeDamage // для ручного тестирования из консоли
// };
