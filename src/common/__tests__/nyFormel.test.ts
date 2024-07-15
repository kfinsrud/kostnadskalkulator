import {patchHarvestFJ, selectionHarvestFJ, t_forw_bb} from "../src/nyFormel";


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


