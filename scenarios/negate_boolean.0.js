// Source: 46604f1156bc581120f18fb68bd532166075e4e5?branch=46604f1156bc581120f18fb68bd532166075e4e5

    if(matches.length) {
    } else {
        var m = null
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })
    }
