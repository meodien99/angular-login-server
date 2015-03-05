module.exports = {
    dest : __dirname + "/../../public/uploads",
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    }
};