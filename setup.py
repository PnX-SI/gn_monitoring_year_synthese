import setuptools
from pathlib import Path


root_dir = Path(__file__).absolute().parent
with (root_dir / "VERSION").open() as f:
    version = f.read()
with (root_dir / "README.md").open() as f:
    long_description = f.read()
with (root_dir / "requirements.in").open() as f:
    requirements = f.read().splitlines()


setuptools.setup(
    name="MonitoringYearSynthese",
    version=version,
    description="Module pour le visualisation des monitoring par année",
    long_description=long_description,
    long_description_content_type="text/markdown",
    maintainer="Parc National des Ecrins",
    maintainer_email="geonature@ecrins-parcnational.fr",
    packages=setuptools.find_packages("backend"),
    package_dir={"": "backend"},
    package_data={"gn_module_monitoring_year_synthese.migrations": ["data/*.sql"]},
    install_requires=requirements,
    zip_safe=False,
    entry_points={
        "gn_module": [
            "code = gn_module_monitoring_year_synthese:MODULE_CODE",
            "picto = gn_module_monitoring_year_synthese:MODULE_PICTO",
            "blueprint = gn_module_monitoring_year_synthese.blueprint:blueprint",
            "config_schema = gn_module_monitoring_year_synthese.conf_schema_toml:GnModuleSchemaConf",
            "migrations = gn_module_monitoring_year_synthese:migrations",
        ],
    },
    classifiers=[
        "Development Status :: 1 - Planning",
        "Intended Audience :: Developers",
        "Natural Language :: English",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "License :: OSI Approved :: GNU Affero General Public License v3",
        "Operating System :: OS Independent",
    ],
)
