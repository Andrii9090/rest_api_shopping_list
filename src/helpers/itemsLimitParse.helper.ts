const separateQueryParam = (limit: string): { offset: number, limit: number } => {
    const limitArr = limit.split(',')
    if (limitArr.length == 1) {
        return {
            limit: Number(limitArr[0]),
            offset: 0
        }
    }
    return {
        offset: Number(limitArr[0]),
        limit: Number(limitArr[1])
    }
}

export {
    separateQueryParam
}