import { BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import User from "./user.model";
import ListUser from "./listUser.model";


@Table({
    tableName: 'lists',
    modelName: 'List',
})
class List extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare title: string

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    declare creator_id: number

    @BelongsToMany(() => User, () => ListUser, 'list_id', 'user_id')
    declare users: User[]

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true
    })
    declare is_active: boolean

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    declare is_delete: boolean

}

export default List