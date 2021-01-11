module.exports = function(app, config) {
    const user = require(config.controller_path + '/authentication/User')
    const consignor = require(config.controller_path + '/masters/Consignor')
    const unit = require(config.controller_path + '/masters/Unit')
    const routes = {
        user : new user(),
        consignor : new consignor(),
        unit : new unit()
    }

    for (x in routes) {
        let route = x.toString()
        let c = routes[x]
        app.get('/' + route, (req, res)=>{
            c.index(req, res)
        })
        app.get('/' + route + '/:id', (req, res)=>{
            c.detail(req, res)
        })
    }

    // other routes
    app.post('/login', (req, res)=> {
        let controller = new user()
        controller.login(req, res)
    })

    app.post('/register', (req, res)=> {
        let controller = new user()
        controller.register(req, res)
    })
}