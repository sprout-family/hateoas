Changelog
=========

0.2.0 (????-??-??)
------------------

* Allow relationships to be specified as nullable. If it is nullable, it may be
  omitted when creating a State.
* Updated all dependencies and removed mocha and chai dependency.
* Dropped Node 18 support.


0.1.5 (2024-02-22)
------------------

* `metadata` should be optional when constructring state


0.1.4 (2024-02-22)
------------------

* Add 'metadata' to state objects. Metadata will not be serialized.
* Exporting `StateSchema`.
* Added a `CollectionOf` utility type for easily turning a single entity in a
  collection.


0.1.3 (2024-02-22)
------------------

* Loosen type of SchemaDefaults so it's more usable.
* Make the relationships property optional when constructing a state.


0.1.2 (2024-02-18)
------------------

* Add support for Siren.
* Show `alternate` links indicating the available options.


0.1.1 (2024-02-18)
------------------

* `uri` is now optional when creating State objects, and will default to the
  current request url.


0.1.0 (2024-02-18)
------------------

* Added a `State` class and middleware that automatically generates HAL.
