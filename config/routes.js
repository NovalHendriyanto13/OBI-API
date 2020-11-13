module.exports = function(app, config) {
    const user = require(config.controller_path + '/authentication/User')
    const routes = {
        user : new user()
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
        let model = new user()
        model.login(req, res)
    })
}