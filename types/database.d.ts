export type TableName = 'fish' | 'accessories' | 'food';

export interface DatabaseTable {
  table: TableName;
  exists: boolean;
}

export interface TableCheckResult {
  success: boolean;
  tables: DatabaseTable[];
}
