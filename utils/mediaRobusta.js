function mediaRobusta(valores) {

    if (valores.length === 0) {
        return 0;
    }

    const sorted =
        [...valores].sort((a, b) => a - b);

    const trim =
        Math.floor(sorted.length * 0.2);

    const filtrado =
        sorted.slice(
            trim,
            sorted.length - trim
        );

    const base =
        filtrado.length > 0
            ? filtrado
            : sorted;

    return (
        base.reduce((a, b) => a + b, 0)
        / base.length
    );
}

module.exports = mediaRobusta;