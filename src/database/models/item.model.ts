import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript"
import List from './list.model'
import User from './user.model'

@Table({
    tableName: 'items',
    modelName: 'Item'
})
class Item extends Model {

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare title: string

    @ForeignKey(() => List)
    @Column({
        type: DataType.INTEGER
    })
    declare list_id: number

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    declare creator_id: number

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

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare image: string | null
}

export default Item