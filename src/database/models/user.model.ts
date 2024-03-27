import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import Item from "./item.model";
import List from "./list.model";
import ListUser from "./listUser.model";

@Table({
    tableName: 'users',
    modelName: 'User',
    timestamps: true
})
class User extends Model {
    @Column({
        type: DataType.STRING,
    })
    declare first_name: string

    @Column({
        type: DataType.STRING,
    })
    declare last_name: string

    @Column({
        type: DataType.STRING,
        unique: true
    })
    declare email: string

    @Column({
        type: DataType.STRING,
    })
    declare password: string

    @Column({
        type: DataType.STRING,
        defaultValue: ''
    })
    declare access_code: string

    @Column({
        defaultValue: true,
        type: DataType.BOOLEAN,
    })
    declare is_active: boolean

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    declare is_admin: boolean

    @HasMany(() => Item)
    declare items: Item[]

    @HasMany(() => List)
    declare lists_creator: List[]

    @BelongsToMany(() => List, () => ListUser, 'user_id', 'list_id')
    declare lists: List[]
}

export default User