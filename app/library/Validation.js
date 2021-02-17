class Validation {
    constructor() {
        this.res = []
    }

    check(params, rules) {
        for(let key in rules) {
            let rule = rules[key].split('|')
            let i = 0
            for(let v of rule) {
                if (v == 'required') {
                    this.required(key, params[key])
                }

                if (v == 'numeric') {
                    this.numeric(key, params[key])
                }
                i++
            }
        }
        return this.res;
    }

    required(key, param) {
        const errStr = " is Required"
        if (typeof(param) === 'undefined' || param == '') {
            if (typeof(this.res[key]) === 'undefined') {
                this.res[key] = []
            }
            this.res[key].push(key + errStr) 
        }
    }

    numeric(key, param) {
        const errStr = " is Numeric"
        if (typeof(param) === 'undefined') {
            if (typeof(this.res[key]) === 'undefined') {
                this.res[key] = []
            }
            this.res[key].push(key + errStr) 
        }
    }
}
module.exports = Validation