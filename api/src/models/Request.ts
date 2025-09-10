import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./User";

export type ReqStatus = "pending" | "accepted" | "rejected" | "cancelled";

interface RequestAttrs {
  id: string;
  userId: string;
  boatCode: string;
  startAt: Date;
  endAt: Date;
  route: any; // JSON array [{lat,lon},...]
  status: ReqStatus;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
type RequestCreation = Optional<RequestAttrs, "id" | "status" | "rejectionReason">;

export class Request extends Model<RequestAttrs, RequestCreation> implements RequestAttrs {
  public id!: string;
  public userId!: string;
  public boatCode!: string;
  public startAt!: Date;
  public endAt!: Date;
  public route!: any;
  public status!: ReqStatus;
  public rejectionReason!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Request.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    boatCode: { type: DataTypes.STRING(10), allowNull: false },
    startAt: { type: DataTypes.DATE, allowNull: false },
    endAt: { type: DataTypes.DATE, allowNull: false },
    route: { type: DataTypes.JSONB, allowNull: false },
    status: { type: DataTypes.ENUM("pending", "accepted", "rejected", "cancelled"), allowNull: false, defaultValue: "pending" },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true }
  },
  { sequelize, tableName: "requests" }
);

User.hasMany(Request, { foreignKey: "userId" });
Request.belongsTo(User, { foreignKey: "userId" });
