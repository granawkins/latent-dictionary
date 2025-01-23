import numpy as np
from app import pca


def test_pca_2d():
    # Test with 2D input
    input_data = [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    result = pca(input_data)

    # Check output shape
    assert len(result) == 3
    assert len(result[0]) == 3

    # Check type
    assert isinstance(result, list)
    assert isinstance(result[0], list)
    assert isinstance(result[0][0], float)


def test_pca_3d():
    # Test with 3D input (batch of embeddings)
    input_data = [
        [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]],
        [[0.0, 0.0, 1.0], [1.0, 1.0, 1.0]],
    ]
    result = pca(input_data)

    # Check output shape
    assert len(result) == 4  # 2x2 inputs flattened to 4
    assert len(result[0]) == 3  # 3D output

    # Check type
    assert isinstance(result, list)
    assert isinstance(result[0], list)
    assert isinstance(result[0][0], float)


def test_pca_preserves_distances():
    # Test that PCA preserves relative distances between points
    input_data = [[1.0, 0.0, 0.0], [2.0, 0.0, 0.0], [3.0, 0.0, 0.0]]
    result = pca(input_data)

    # Convert to numpy for easier calculations
    result_array = np.array(result)

    # Check that the relative distances are preserved
    # (not necessarily exactly the same, but proportional)
    orig_dist_1_2 = np.linalg.norm(np.array(input_data[1]) - np.array(input_data[0]))
    orig_dist_2_3 = np.linalg.norm(np.array(input_data[2]) - np.array(input_data[1]))

    new_dist_1_2 = np.linalg.norm(result_array[1] - result_array[0])
    new_dist_2_3 = np.linalg.norm(result_array[2] - result_array[1])

    # Check if the ratio of distances is approximately preserved
    ratio_orig = orig_dist_1_2 / orig_dist_2_3
    ratio_new = new_dist_1_2 / new_dist_2_3
    assert abs(ratio_orig - ratio_new) < 1e-10
