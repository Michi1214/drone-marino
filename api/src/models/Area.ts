import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface AreaAttrs {
  id: string;
  name?: string | null;
  lat1: number; lon1: number;
  lat2: number; lon2: number;
  validFrom?: Date | null;
  validTo?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
type AreaCreation = Optional<AreaAttrs, "id" | "name" | "validFrom" | "validTo">;

export class Area extends Model<AreaAttrs, AreaCreation> implements AreaAttrs {
  public id!: string;
  public name!: string | null;
  public lat1!: number; public lon1!: number;
  public lat2!: number; public lon2!: number;
  public validFrom!: Date | null;
  public validTo!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Area.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING(120), allowNull: true },
    lat1: { type: DataTypes.DOUBLE, allowNull: false },
    lon1: { type: DataTypes.DOUBLE, allowNull: false },
    lat2: { type: DataTypes.DOUBLE, allowNull: false },
    lon2: { type: DataTypes.DOUBLE, allowNull: false },
    validFrom: { type: DataTypes.DATE, allowNull: true },
    validTo: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: "areas" }
);
