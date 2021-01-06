
    componentDidUpdate() {
        if(this.state.open) {
            document.oncontextmenu = this.secondaryClick
        } else {
            document.oncontextmenu = null
        }
    }