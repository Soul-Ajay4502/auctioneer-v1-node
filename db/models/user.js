'use strict'
import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.config.js'
import { AppError } from '../../src/utils/app-error.js'
import { passwordUtils } from '../../src/utils/password.util.js'

const User = sequelize.define(
    'users',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        user_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'firstName cannot be null',
                },
                notEmpty: {
                    msg: 'firstName cannot be empty',
                },
            },
        },
        display_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'firstName cannot be null',
                },
                notEmpty: {
                    msg: 'firstName cannot be empty',
                },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'email cannot be null',
                },
                notEmpty: {
                    msg: 'email cannot be empty',
                },
                isEmail: {
                    msg: 'Invalid email id',
                },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'password cannot be null',
                },
                notEmpty: {
                    msg: 'password cannot be empty',
                },
            },
        },
        confirm_password: {
            type: DataTypes.VIRTUAL,
            set(value) {
                if (this.password.length < 7) {
                    throw new AppError('Password length must be grater than 7', 400)
                }
                if (value !== this.password) {
                    throw new AppError('Password and confirm password must be the same', 400)
                }
                // Password will be hashed in the beforeCreate/beforeUpdate hooks
            },
        },
        img_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        verification_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        verification_code_expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        refresh_token: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        // Timestamps (created_at, updated_at) are managed automatically by Sequelize
        // deleted_at is managed by the paranoid option
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
        defaultScope: {
            attributes: {
                exclude: ['password', 'refresh_token', 'verification_code'],
            },
        },
        scopes: {
            withPassword: {
                attributes: { include: ['password'] },
            },
        },
        hooks: {
            beforeValidate: async (user) => {
                if (user.password) {
                    passwordUtils.validatePassword(user.password)
                }
            },
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await passwordUtils.hashPassword(user.password)
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    passwordUtils.validatePassword(user.password)
                    user.password = await passwordUtils.hashPassword(user.password)
                }
            },
        },
    },
)

export default User // Exporting the User model
