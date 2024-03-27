import { options } from "joi";
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: 'user_access_code',
    modelName: 'UserAccessCode',
})
class UserAccessCode extends Model {
    @Column({
        type: DataType.INTEGER
    })
    declare code: number

    @Column({
        type: DataType.STRING
    })
    declare expire_date: string
    @Column({
        type: DataType.INTEGER
    })
    declare user_id: number
}

export default UserAccessCode