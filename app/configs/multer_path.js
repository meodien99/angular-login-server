module.exports = {
    dest : __dir + "/../../public/uploads",
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    }
};