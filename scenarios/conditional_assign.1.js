
    componentDidUpdate() {
        document.oncontextmenu = this.state.open
            ? this.secondaryClick
            : null
    }