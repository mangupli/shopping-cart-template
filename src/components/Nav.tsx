type PropsType = {
	viewCart: boolean,
	setViewCart: React.Dispatch<React.SetStateAction<boolean>>
}

const Nav = ({ viewCart, setViewCart }: PropsType) => {

    const btn = viewCart
        ? <button onClick={()=>setViewCart(false)}>View Products</button>
        : <button onClick={()=>setViewCart(true)}>View Cart</button>

    const content = (
        <nav className="nav">
            {btn}
        </nav>
    )

    return content
}

export default Nav