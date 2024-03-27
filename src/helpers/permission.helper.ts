import ListUser from "../database/models/listUser.model";



const userHasPermission = async (userId: number | undefined, listId: number) => {
    const listUser = await ListUser.findOne({
        where: {
            user_id: userId,
            list_id: listId
        }
    })
    if (listUser) {
        return true
    }
    return false
}

export {
    userHasPermission
}