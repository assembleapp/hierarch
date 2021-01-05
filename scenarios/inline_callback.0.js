// Source: 674dcef5427e82718c9f45561fc6d719eed6f34b
    var clause = (matches, callback) => { matches.length ? null : callback(null) }
    clause(matches, m => {
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })
    })
