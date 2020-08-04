module.exports = options => (...args) => {
    const router = require('express').Router();
    for(let i = 0; i < args.length; i++) {
        const item = args[i];
        if(!(item.router || item.next || item.controller)) {
            throw new Error('Either `next` or `controller` must be defined');
        }
        if(!item.action) {
            item.action = 'use';
        }
        if(item.action.match(/^(use|get|post|put|delete|option)$/i)) {
            router[item.action.toLowerCase()](
                item.path || '/', 
                ...(item.before || []),
                (req, res, next) => {
                    if(item.next) {
                        item.next(req, res, next);
                    }else if(item.controller){
                        const onResult =  item.onResult? item.onResult : options && options.onResult? options.onResult : async (ctx, result) => {
                            try {
                                res.send(await result)
                            }catch(err) {
                                next(err)
                            }
                        }
                        onResult( {req, res, next}, item.controller(req));
                        
                    }
                 },
                 ...(item.after || [])
            )
        }else{
            throw new Error('Invalid action type');
        }
    }

    return router;
}