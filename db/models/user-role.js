import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.config.js'
import User from './user.js'

const UserRole = sequelize.define(
    'user_roles',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'label cannot be null',
                },
                notEmpty: {
                    msg: 'label cannot be empty',
                },
            },
        },
        access_level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'access_level cannot be null',
                },
            },
        },
        created_at: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updated_at: {
            allowNull: false,
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: 'UserRole',
        tableName: 'user_roles',
        underscored: true,
        timestamps: true,
    },
)

const setupAssociations = async () => {
    try {
        const User = (await import('./user.js')).default
        UserRole.hasMany(User, { foreignKey: 'user_type' })
        User.belongsTo(UserRole, { foreignKey: 'user_type' })
    } catch (error) {
        console.error('Error setting up UserRole associations:', error)
    }
}

setupAssociations()

export default UserRole
