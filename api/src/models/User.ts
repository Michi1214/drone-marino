import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export type Role = "user" | "operator" | "admin";

interface UserAttrs {
  id: string;
  email: string;
  role: Role;
  tokens: number;
  createdAt?: Date;
  updatedAt?: Date;
}
type UserCreation = Optional<UserAttrs, "id" | "tokens">;

export class User extends Model<UserAttrs, UserCreation> implements UserAttrs {
  public id!: string;
  public email!: string;
  public role!: Role;
  public tokens!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    role: { type: DataTypes.ENUM("user", "operator", "admin"), allowNull: false },
    tokens: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  },
  { sequelize, tableName: "users" }
);
