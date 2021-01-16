module.exports = function(app, config) {
    const user = require(config.controller_path + '/authentication/User')
    const unit = require(config.controller_path + '/masters/Unit')
    const area = require(config.controller_path + '/masters/Area')
    const auction = require(config.controller_path + '/auction/Auction')

    const routes = {
        user : new user(),
        unit : new unit(),
        area: new area(),
        auction : new auction()
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