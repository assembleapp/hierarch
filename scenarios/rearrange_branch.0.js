// Source: 23ec9cd7851857bfa1bc54798f2ae0cc4a0e6bc2


    matches.length ? null : (m => {
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })
    })(null)
