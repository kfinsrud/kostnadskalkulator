import express, {Express} from "express";
import {
    addCalculator, calculateResult,
    cors,
    getCalculatorSchema,
    getCalculatorsInfo,
    getCalculatorTree,
} from "./controllers";
import * as http from "http";
import {Configuration} from "../types/config";
import rateLimit from "express-rate-limit";

export default class WebServer {
    #config: Configuration
    app: Express    // must be exposed for the testing framework
    #httpServer: http.Server | undefined

    constructor(config: Configuration) {
        this.#config = config
        this.app = express()
        this.app.set('trust proxy', true) // Trust X-Forwarded-For from Google Cloud load balancer
        this.#initRouting()
    }

    run() {
        this.#startHTTP()
        return this
    }

    stop() {
        this.#httpServer?.close()
    }

    #initRouting() {
        let router = express.Router()
            .use(rateLimit({
                windowMs: 5 * 60 * 1000,
                limit: 300,
                validate: {trustProxy: false} // Disable validation warning - we handle proxy configuration
            }))
            .use(express.json({limit: '32mb'}))
            .use(cors()) // temprory during development to allow CORS
            .get('/api/v1/getCalculatorsInfo', getCalculatorsInfo(this.#config.database))
            .get('/api/v1/getCalculatorTree', getCalculatorTree(this.#config.database))
            .get('/api/v1/getCalculatorSchema', getCalculatorSchema(this.#config.database))
            .post('/api/v1/addCalculator', addCalculator(this.#config.database, this.#config.auth))
            .post('/api/v1/calculate', calculateResult(this.#config.database))
        this.app.use(router)
    }

    #startHTTP() {
        this.#httpServer = this.app.listen(this.#config.httpPort, () => {
            console.log(`Server is running at http://localhost:${this.#config.httpPort}`)
        })
    }

}