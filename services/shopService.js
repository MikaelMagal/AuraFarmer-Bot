const userService =
    require("./userService");

const inventoryService =
    require("./inventoryService");

function buyItem(userId, item) {

    if (
        inventoryService.hasItem(
            userId,
            item.id
        )
    ) {
        return {
            success: false,
            message: "Você já possui esse item."
        };
    }

    const aura =
        userService.getAura(userId);

    if (aura < item.preco) {

        return {
            success: false,
            message: "Aura insuficiente."
        };
    }

    inventoryService.addItem(
        userId,
        item.id
    );

    userService.addAura(
        userId,
        -item.preco
    );

    return {
        success: true
    };
}

module.exports = {
    buyItem
};