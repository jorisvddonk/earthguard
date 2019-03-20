import { Faction } from './faction';

class FactionRegistry {
    private _factions: Map<string, Faction>;
    constructor() {
        this._factions = new Map();
    };

    public register(faction) {
        if (!this._factions.has(faction.name)) {
            this._factions.set(faction.name, faction);
        } else {
            throw new Error("Faction already registered!");
        }
    };

    public get(name) {
        return this._factions.get(name);
    }
}

const factionRegistry = new FactionRegistry();

factionRegistry.register(new Faction({ name: 'Civilians', color: 'grey' }));
factionRegistry.register(new Faction({ name: 'Pirates', color: 'red' }));
factionRegistry.register(new Faction({ name: 'Police', color: 'blue' }));
factionRegistry.register(new Faction({ name: 'Player', color: 'white' }));

export default factionRegistry;