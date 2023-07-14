const c_proc = require("child_process");

exports.githash = () => {
    try {
       return c_proc.execSync("git log --pretty=format:%h -n 1");
      } catch (error) {
        return "";
      }
}

exports.gitclean = () => {
    try {
        var mod = c_proc.execSync("git status -uno --porcelain");
        if (mod == "") {
            return "";
        }
        return "!"
      } catch (error) {
        return "?";
      }
}