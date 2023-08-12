from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in sampat_industries/__init__.py
from sampat_industries import __version__ as version

setup(
	name="sampat_industries",
	version=version,
	description="Custom App For Sampat Industries",
	author="Niraj",
	author_email="niraj@sampat.co.in",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
