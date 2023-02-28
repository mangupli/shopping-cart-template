import { Children, createContext, ReactElement, useMemo, useReducer } from "react"

export type CartItemType = {
    sku: string,
    name: string,
    price: number,
    qty: number
} 

type CartStateType = {
    cart: CartItemType[]
}

const initCartState: CartStateType = { cart: [] }

const REDUCER_ACTION_TYPE = {
    ADD: "ADD",
    REMOVE: "REMOVE",
    QTY: "QTY",
    SUBMIT: "SUBMIT"
}

export type ReducerActionType = typeof REDUCER_ACTION_TYPE;

export type ReducerAction = {
    type: string,
    payload?: CartItemType
}

const reducer = (state: CartStateType, action: ReducerAction):CartStateType => {

    switch (action.type) {
        case REDUCER_ACTION_TYPE.ADD: {
            if(!action.payload){
                throw new Error('No action.payload in ADD action')
            }
            const { sku, name, price } = action.payload;

            const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku);

            const itemExists: CartItemType | undefined = state.cart.find(item => item.sku === sku);
            const qty = itemExists ? itemExists.qty + 1 : 1;

            return {...state, cart: [...filteredCart, {sku, name, price, qty}]}                   
        }
        case REDUCER_ACTION_TYPE.REMOVE: {
            if(!action.payload){
                throw new Error('No action.payload in REMOVE action')
            }            
            
            const { sku } = action.payload;

            const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku);

            return {...state, cart: filteredCart};
             
        }
        case REDUCER_ACTION_TYPE.QTY: {
            if(!action.payload){
                throw new Error('No action.payload in qty action')
            }

            const { sku, qty } = action.payload;

            const itemExists: CartItemType | undefined = state.cart.find(item => item.sku === sku);
            if (!itemExists) {
                throw new Error('Trying to update a quantity of a non-existent cart item')
            }

            const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku);
            const updatedItem: CartItemType = {...itemExists, qty}

            return {...state, cart: [...filteredCart, updatedItem]}
             
        }
        case REDUCER_ACTION_TYPE.SUBMIT: {
            //send the data to the server
            // and empty the cart
            return { ...state, cart: [] }
        }
        default: {
            throw new Error('Unidentified action type')
        }
    }
}

const useCartContext = (initCartState: CartStateType) => {

    const [ state, dispatch ] = useReducer(reducer, initCartState);

    //so it will be possible to memoize the component without worrying that reducer action type will cause rerender
    const REDUCER_ACTIONS = useMemo(() => {
        return REDUCER_ACTION_TYPE
    }, []);

    const totalItems: number = state.cart.reduce(( prevValue, cartItem ) => {
        return prevValue + cartItem.qty;
    }, 0);

    const totalPrice: string = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
        state.cart.reduce(( prevValue, cartItem ) => {
            return prevValue + (cartItem.qty * cartItem.price);
        }, 0)
    )

    //sorting
    const cart = state.cart.sort((a, b) => {
        const itemA = Number(a.sku.slice(-4)) // because sku is in the format of { "sku": "item0002" }
        const itemB = Number(b.sku.slice(-4))
        return itemA - itemB;
    })

    return { dispatch, REDUCER_ACTIONS, totalItems, totalPrice, cart};

}

export type UseCartContextType = ReturnType<typeof useCartContext>;

const initCartContextState: UseCartContextType = {
    dispatch: () => {},
    REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
    totalItems: 0,
    totalPrice: '',
    cart: []
}

export const CartContext = createContext<UseCartContextType>(initCartContextState);

type ChildrenType = {
    children: ReactElement
}

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
    return (
        <CartContext.Provider value={useCartContext(initCartContextState)}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext;