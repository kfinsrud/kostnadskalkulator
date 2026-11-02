import {IDatabase} from "../models/IDatabase";
import express from "express";
import {Calculator} from "@skogkalk/common/dist/src/types/Calculator";
import {AuthenticationError, BadRequestError, DatabaseError, NotFoundError} from "../types/errorTypes";
import {IAuth} from "../models/IAuth";

/**
 * Adds a calculator to the database
 */
export function addCalculator(db: IDatabase, auth: IAuth) {
    return async function(req: express.Request, res: express.Response) {
        const c: Calculator = req.body
        const idToken = req.headers.authorization?.split('Bearer ')[1]

        if (!idToken) {
            return res.status(401).json({error: "Authorization token is required"})
        } else if (!c.reteSchema || !c.treeNodes) {
            return res.status(400).json({ error: "fields reteSchema and treeNodes are required" })
        } else if (!c.name || !c.version || isNaN(c.version)) {
            return res.status(400).json({ error: "fields name and version cannot be empty or zero" })
        }

        await respondToResult(auth.verifyToken(idToken).then(() => db.addCalculator(c)), res)
    }
}

/**
 * Handler for fetching metainfo on all calculator versions in the database
 */
export function getCalculatorsInfo(db: IDatabase) {
    return async function(_req: express.Request, res: express.Response) {
        await respondToResult(db.getCalculatorsInfo(), res)
    }
}

/**
 * Returns the parse tree of a specific calculator version
 */
export function getCalculatorTree(db: IDatabase) {
    return async function(req: express.Request, res: express.Response) {
        const queryParams = validateGetCalculatorQueryNameAndVersion(req, res)
        if (!queryParams) return

        await respondToResult(db.getCalculatorTree(queryParams.name, queryParams.version), res)
    }
}

/**
 * Returns the rete schema of a specific calculator version
 */
export function getCalculatorSchema(db: IDatabase) {
    return async function(req: express.Request, res: express.Response) {
        const queryParams = validateGetCalculatorQueryNameAndVersion(req, res)
        if (!queryParams) return

        await respondToResult(db.getCalculatorSchema(queryParams.name, queryParams.version), res)
    }
}

export function calculateResult(db: IDatabase) {
    return async function(req: express.Request, res: express.Response) {
        const {name, version, mode, inputs} = (req.body ?? {}) as {
            name: string,
            version: number,
            mode: string,
            inputs: any
        }

        /*
         Commented out the old way of extracting request body parameters as the tests suddenly started failing with it. 
         Using the nullish coalescing operator to provide a default empty object for req.body as a fallback.
        
        // const {name, version, mode, inputs} = req.body as { name: string, version: number, mode: string, inputs: any } 
        */
        if (!name || !version || isNaN(version) || !mode || !['strict', 'relaxed'].includes(mode)) {
            return res.status(400).json({error: "Name, version and mode are required"})
        }

        await respondToResult(db.calculate(name, version, inputs, mode == 'strict'), res)
    }
}

/**
 * Adds CORS headers to the response
 */
export function cors() {
    return function(_req: express.Request, res: express.Response, next: express.NextFunction) {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Credentials", "true")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-No-Cache")
        next()
    }
}

/**
 * Validates the query parameters for the getCalculatorTree and getCalculatorSchema endpoints
 */
function validateGetCalculatorQueryNameAndVersion(req: express.Request, res: express.Response): {name: string, version: number} | null {
    const { name, version } = req.query as { name: string, version: string }
    if (!name || isNaN(parseInt(version))) {
        res.status(400).json({ error: "Name and version are required" }).send()
        return null
    }
    return { name, version: parseInt(version) };
}

/**
 * Helper function that resolves a operation and send the appropriate response to the caller
 */
async function respondToResult(operation: Promise<any>, res: express.Response) {
    operation
        .then(result => { res.status(200).send(result) })
        .catch(e => {
            if (e instanceof BadRequestError) {
                res.status(400).json({error: "Some of your input is invalid: " + e.message})
            } else if (e instanceof AuthenticationError) {
                res.status(401).json({error: "Invalid authorization token"})
            } else if (e instanceof NotFoundError) {
                res.status(404).json({error: "The resource you requested was not found: " + e.message});
            } else if (e instanceof DatabaseError) {
                res.status(500).json({error: "We are experiencing technical difficulties. Please try again later."})
            } else {
                res.status(500).json({error: "An unexpected issue occurred. Please try again later."})
            }
        })
}