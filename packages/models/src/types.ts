export interface PrimaryKey {
  pk: string;
  sk: string;
}

export interface AppTableItem extends PrimaryKey {
  gs1pk?: string;
  gs1sk?: string;
}
