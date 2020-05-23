/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class ChainMedic extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const patients = [
            {
                name: 'p1',
                gender: 'female',
                temp: '36.2',
                doctor: 'Dr.Li',
                weight: '76',
                height: '175',
                notes: 'He is fine',
            },
            {
                name: "p2",
                gender: 'male',
                temp: '38.2',
                doctor: 'Dr.Li',
                weight: '80',
                height: '185',
                notes: 'He is sick',
            },
        ];

        for (let i = 0; i < patients.length; i++) {
            patients[i].hospital = 'Goodwill Hospital';
            await ctx.stub.putState('PATIENT' + i, Buffer.from(JSON.stringify(patients[i])));
            console.info('Added <--> ', patients[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryPatient(ctx, patientNumber) {
        const patientAsBytes = await ctx.stub.getState(patientNumber);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`${patientNumber} does not exist`);
        }
        console.log(patientAsBytes.toString());
        return patientAsBytes.toString();
    }

    async createPatient(ctx, patientNumber, make, model, color, owner) {
        console.info('============= START : Create patient ===========');

        const patient = {
            name,
            hospital: 'Goodwill Hospital',
            gender,
            temp,
            doctor,
            weight,
            height,
            notes,
        };

        await ctx.stub.putState(patientNumber, Buffer.from(JSON.stringify(patient)));
        console.info('============= END : Create patient ===========');
    }

    async queryAllPatients(ctx) {
        const startKey = 'patient0';
        const endKey = 'patient999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }


}

module.exports = ChainMedic;
