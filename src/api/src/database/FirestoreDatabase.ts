import FirebaseFirestore, {DocumentSnapshot} from "@google-cloud/firestore";
import {IDatabase} from "../models/IDatabase";
import {FirestoreConfiguration} from "../types/FirestoreConfiguration";
import {ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {Calculator} from "@skogkalk/common/dist/src/types/Calculator";

export class FirestoreDatabase implements IDatabase {
    #db: FirebaseFirestore.Firestore

    /**
     * Creates a new FirestoreDatabase instance
     * @param config
     */
    constructor(config: FirestoreConfiguration) {
        this.#db = new FirebaseFirestore.Firestore({
            projectId: config.projectId
        })

        // use local emulator if not in production
        if (process.env.NODE_ENV !== 'production') {
            this.#db.settings({
                host: 'localhost:8080',
                ssl: false
            })
        }
    }

    /**
     * Adds a calculator to the database
     */
    async addCalculator(c: Calculator): Promise<void> {
        const ref = this.#db
            .collection('calculators')
            .doc(c.name)
            .collection('versions')
            .doc(c.version.toString())

        // TODO: implement conflict checking/resolution with transaction
        //  (e.g. if a calculator with the same name and version already exists)
        //  right now it just overwrites the existing calculator
        await this.#db.runTransaction(async (t) => { t.set(ref, c) })
            .catch(() => { throw new Error('An error occurred while adding the calculator') })
    }


    /**
     * Returns metainfo on all calculator versions in the database
     */
    async getCalculatorsInfo(): Promise<Calculator[]> {
        const calculators = await this.#getAllCalculators();
        return calculators
            .map(({treeNodes, reteSchema, ...rest}) => {
                return {...rest};
            });

    }

    /**
     * Returns the parse tree of a specific calculator version
     */
    async getCalculatorTree(name: string, version: number): Promise<ParseNode[]> {
        const doc = await this.#getCalculatorByNameAndVersion(name, version);
        return this.#getCalculatorField(doc, 'treeNodes');
    }

    /**
     * Returns the rete schema of a specific calculator version
     */
    async getCalculatorSchema(name: string, version: number): Promise<any> {
        const doc = await this.#getCalculatorByNameAndVersion(name, version);
        return this.#getCalculatorField(doc, 'reteSchema');
    }


    /**
     * Returns all calculator versions in the database
     * @private
     */
    async #getAllCalculators(): Promise<Calculator[]> {
         return this.#db
            .collectionGroup('versions')
            .get()
            .then(snapshot => snapshot.docs.map(doc => doc.data() as Calculator))
            .catch(() => { throw new Error('An error occurred while getting the calculators') })


    }

    /**
     * Returns a specific calculator version from the database
     * @private
     */
    async #getCalculatorByNameAndVersion(name: string, version: number): Promise<DocumentSnapshot> {
        return this.#db
            .collection('calculators')
            .doc(name)
            .collection('versions')
            .doc(version.toString())
            .get()
            .then(doc => {
                if (doc.exists) return doc
                throw new Error('Calculator not found') })
            .catch(() => { throw new Error('An error occurred while getting the calculator') })
    }

    /**
     * Returns a specific field from a calculator document
     * @param doc - the calculator document from Firestore
     * @param fieldName - a string representing the field name
     * @private
     */
    #getCalculatorField(doc: DocumentSnapshot, fieldName: string): any {
        const data = doc.data()
        if (data && data.hasOwnProperty(fieldName)) {
            return data[fieldName]
        } else {
            throw new Error(`Field ${fieldName} not found on calculator`)
        }
    }
}