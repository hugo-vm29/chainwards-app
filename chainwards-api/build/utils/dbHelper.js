"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctContractsForOwner = exports.getCollectionPipeline = void 0;
const getCollectionPipeline = () => {
    const collectionsPipeline = [
        {
            $lookup: {
                from: 'transactions',
                localField: 'transactionId',
                foreignField: '_id',
                as: 'transactionInfo',
            },
        },
        {
            $unwind: {
                path: '$transactionInfo',
            },
        },
        {
            $addFields: {
                chainId: '$transactionInfo.chainId',
            },
        },
        {
            $project: {
                transactionId: 0,
                issuers: 0,
                'transactionInfo.chainId': 0,
                'transactionInfo.from': 0,
                'transactionInfo.to': 0,
                'transactionInfo.transactionType': 0,
                'transactionInfo.contractAddress': 0,
                'transactionInfo.timestamp': 0,
            },
        },
        { $sort: { createdOn: -1 } },
    ];
    return collectionsPipeline;
};
exports.getCollectionPipeline = getCollectionPipeline;
const getDistinctContractsForOwner = (ownerAddr) => {
    const qryPipeline = [
        {
            $match: {
                owner: ownerAddr,
            },
        },
        {
            $lookup: {
                from: 'collections',
                localField: 'collectionId',
                foreignField: '_id',
                as: 'collectionInfo',
            },
        },
        {
            $unwind: {
                path: '$collectionInfo',
            },
        },
        {
            $project: {
                tokenId: 1,
                collectionId: 1,
                'collectionInfo.name': 1,
                'collectionInfo.contractAddress': 1,
                'collectionInfo.chainId': 1,
            },
        },
        {
            $group: {
                _id: '$collectionInfo.chainId',
                contracts: { $push: '$$ROOT' },
            },
        },
    ];
    return qryPipeline;
};
exports.getDistinctContractsForOwner = getDistinctContractsForOwner;
