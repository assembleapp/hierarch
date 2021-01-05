// Source: 041d036dcdc03f923525d9c5b3989fc414e936a0

program.reparse()
if(change &&
    change.code &&
    change.source === program.name &&
    change.upgrade
) {
    drop_dependency(program)
} else {
    add_dependency(program)
}
