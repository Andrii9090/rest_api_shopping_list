import { Column, DataType, ForeignKey, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "./user.model";
import List from "./list.model";

@Table({
    tableName: 'lists_users',
    modelName: 'ListUser',
    timestamps: false
})
class ListUser extends Model {

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true
    })
    declare user_id: number

    @ForeignKey(() => List)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true
    })
    declare list_id: number

    }

export default ListUser