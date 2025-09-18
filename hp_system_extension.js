// Самое начало файла hp_system_extension.js
console.log("[HP System DEBUG] Starting HP System Extension loading process.");

let mainCharacterHP = 100;

// ... (остальной твой код) ...

SillyTavern.getContext().registerFunctionTool({
    name: 'take_damage',
    // ...
    callback: async (args) => {
        console.log(`[HP System DEBUG] take_damage callback received from LLM for amount: ${args.amount}`); // Добавлено
        const damageResult = takeDamage(args.amount);
        return damageResult;
    }
});
console.log("[HP System DEBUG] take_damage function registration attempted."); // Добавлено

SillyTavern.getContext().registerFunctionTool({
    name: 'reset_hp',
    // ...
    callback: async (args) => {
        console.log(`[HP System DEBUG] reset_hp callback received from LLM.`); // Добавлено
        const resetTo = args.initial_hp || 100;
        setCharacterHP(resetTo);
        const message = `[HP System] Main character HP has been reset to ${resetTo}.`;
        return message;
    }
});
console.log("[HP System DEBUG] reset_hp function registration attempted."); // Добавлено

console.log("[HP System DEBUG] HP System Extension finished loading. Current HP: " + mainCharacterHP);
