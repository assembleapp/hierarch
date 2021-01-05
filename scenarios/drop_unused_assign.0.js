// Source: dad547c9b0ec908b528ea9a9240d76ab8bad4ae6
    if(!matches.length) {
        var m = null
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })
    }
