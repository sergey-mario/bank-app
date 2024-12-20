function generateUniqueName() {
    return `User ${Math.floor(Math.random() * 1000000)}`;
}

module.exports = {
    generateUniqueName
};
