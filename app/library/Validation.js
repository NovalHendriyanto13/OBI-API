class Validation {
    constructor() {
        this.res = []
    }

    check(params, rules) {
        for(let key in rules) {
            let rule = rules[key].split('|')
            let i = 0
            for(let v of rule) {
                if (v.trim() == 'required') {
                    this.required(key, params[key])
                }

                if (v.trim() == 'numeric') {
                    this.numeric(key, params[key])
                }

                if (v.trim() == 'email') {
                    this.email(key, params[key])
                }
                i++
            }
        }
        return this.parse();
    }

    parse() {
        let res = []
        for(let key in this.res) {
            res.push(this.res[key])
        }

        return res
    }

    required(key, param) {
        const errStr = " is Required"
        if (typeof(param) === 'undefined' || param == '') {
            if (typeof(this.res[key]) === 'undefined') {
                this.res[key] = []
            }
            this.res[key].push(key.toUpperCase() + errStr) 
        }
    }

    numeric(key, param) {
        const errStr = " is Numeric"
        if (typeof(param) === 'undefined' || isNaN(param)) {
            if (typeof(this.res[key]) === 'undefined') {
                this.res[key] = []
            }
            this.res[key].push(key.toUpperCase() + errStr) 
        }
    }

    email(key, param) {
        const errStr = " is not valid email"
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        if (typeof(param) === 'undefined' || param == '' || emailRegexp.test(param) == false) {
            if (typeof(this.res[key]) === 'undefined') {
                this.res[key] = []
            }
            this.res[key].push(key.toUpperCase() + errStr) 
        }
    }
}
module.exports = Validation