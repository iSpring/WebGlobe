///<amd-module name="world/materials/Material"/>
abstract class Material{
    abstract isReady(): boolean
    abstract destroy(): void
}

export = Material;