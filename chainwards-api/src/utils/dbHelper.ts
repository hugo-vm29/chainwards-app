

export const getCollectionPipeline = () => {
    
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
            'chainId': '$transactionInfo.chainId',
          }
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
            'transactionInfo.timestamp': 0
          },
        },
        { $sort: { createdOn: -1 } },
    ];

    return  collectionsPipeline;
}