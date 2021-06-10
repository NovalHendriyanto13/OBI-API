module.exports = function(app, config) {
    const user = require(config.controller_path + '/authentication/User')
    const unit = require(config.controller_path + '/masters/Unit')
    const area = require(config.controller_path + '/masters/Area')
    const auction = require(config.controller_path + '/auction/Auction')
    const auctionDetail = require(config.controller_path + '/auction/AuctionDetail')
    const article = require(config.controller_path + '/article/Article')
    const npl = require(config.controller_path + '/auction/Npl')
    const brand = require(config.controller_path + '/masters/Brand')
    const bid = require(config.controller_path + '/auction/Bid')

    const routes = {
        user : new user(),
        unit : new unit(),
        area: new area(),
        auction : new auction(),
        auction_detail : new auctionDetail(),
        article : new article(),
        npl : new npl(),
        brand : new brand(),
        bid : new bid(),
    }

    for (x in routes) {
        let route = x.toString()
        let c = routes[x]
        app.post('/' + route, (req, res)=>{
            c.index(req, res)
        })
        
        app.post('/' + route + '/create', (req, res)=> {
            c.create(req, res)
        })

        app.post('/' + route + '/update' + '/:id' , (req, res)=> {
            c.update(req, res)
        })

        app.post('/' + route + '/:id', (req, res)=> {
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

    app.post('/change-password', (req, res)=> {
        let controller = new user()
        controller.changePassword(req, res)
    })

    app.post('/forgot-password', (req, res)=> {
        let controller = new user()
        controller.forgot(req, res)
    })

    app.post('/now-next', (req, res)=> {
        let controller = new auction()
        controller.nowNext(req, res)
    })

    app.post('/brand-type', (req, res)=> {
        let controller = new brand()
        controller.type(req, res)
    })

    app.post('/submit-bid', (req, res)=> {
        let controller = new bid()
        controller.submitBid(req, res)
    })

    app.post('/live-bid', (req, res)=> {
        let controller = new bid()
        controller.liveBid(req, res)
    })

    app.post('/active-npl', (req, res)=> {
        let controller = new npl()
        controller.getActiveByAuction(req, res)
    })

    app.get('/term-condition', (req, res)=> {
        let controller = new article()
        controller.termCondition(req, res)
    })
}