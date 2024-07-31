import {patchHarvestFJ, selectionHarvestFJ, t_forw_bb, t_harv_thinning_bb} from "../src/nyFormel";


test('Lukket hogst1', ()=>{
    const middleStem = 0.8;
    const stemsPerHectare = 500;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 1;
    const surface = 1;


    const result = patchHarvestFJ(
        stemsPerHectare,
        middleStem,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    expect(result.toFixed(3)).toEqual("21.286")
})
test('Lukket hogst2', ()=>{
    const middleStem = 1.5;
    const stemsPerHectare = 700;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 2;
    const surface = 1;


    const result = patchHarvestFJ(
        stemsPerHectare,
        middleStem,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    expect(result.toFixed(3)).toEqual("24.257")
})
test('Lukket hogst3', ()=>{
    const middleStem = 0.8;
    const stemsPerHectare = 500;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 1;
    const surface = 1;


    const result = selectionHarvestFJ(
        stemsPerHectare,
        middleStem,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    console.log(result);
    expect(result.toFixed(3)).toEqual("19.106")
})
test('Lukket hogst4', ()=>{
    const middleStem = 0.7;
    const stemsPerHectare = 500;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 2;
    const surface = 2;


    const result = selectionHarvestFJ(
        stemsPerHectare,
        middleStem,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    console.log(result);
    expect(result.toFixed(3)).toEqual("18.273")
})


test('forwarder', ()=>{
    const result = t_forw_bb(
        "large",
        "Brunberg04",
        "clearcutting",
        100,
        1,
        1,
        1,
        700,
        0,
        300,
        4
    )

    expect(result).toEqual(33.21);
})

test('forwarder', ()=>{
    const result = t_forw_bb(
        "small",
        "Brunberg04",
        "thinning",
        100,
        1,
        1,
        0.2,
        700,
        0,
        500,
        3
    )

    expect(result).toEqual(11.41);
})

test('thinning1', ()=>{
    const result = t_harv_thinning_bb();
    console.log(result);
    expect(result).toEqual(25.329)
})


test('thinning2', ()=>{
    const result = t_harv_thinning_bb(
        800,
        0.25,
        45,
        0.8,
        1,
        1,
        "Brunberg97",
        0,
        "striproad_with_midfield_chainsaw",
        1,
        0.8,
        20,
        4
    );
    console.log(result);
    expect(result).toEqual(14.033)
})

test('thinning3', ()=>{
    const result = t_harv_thinning_bb(
        800,
        0.25,
        45,
        0.8,
        1,
        1,
        "Brunberg97",
        0,
        "striproad_with_midfield_machine",
        1,
        0.8,
        20,
        4
    );
    console.log(result);
    expect(result).toEqual(13.394)
})

test('thinning4', ()=>{
    const result = t_harv_thinning_bb(
        800,
        0.19,
        45,
        0.8,
        1,
        1,
        "Brunberg97",
        0,
        "striproad_with_midfield_machine",
        1,
        0.8,
        20,
        4
    );
    console.log(result);
    expect(result).toEqual(11.24)
})