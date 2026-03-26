function statscard({ title, value }) {
    return (
        <div style={{
            padding: "20px",
            background: "#1e293b",
            color: "white",
            borderRadius: "8px",
            width: "200px"
        }}>
            <h4>{title}</h4>
            <h2>{value}</h2>
        </div>
    );
}

export default statscard;