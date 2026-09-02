interface IValue<T> {
    set(value: T): void;
    get(): T;
}

export declare type ConstructDataType = StructType | IField | IValue;